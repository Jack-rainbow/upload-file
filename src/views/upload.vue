<template>
  <div class="home">
    <div>
        阿里云OSS分片上传      
    </div>
    <!-- uplaod -->
    <el-upload
      action
      :http-request="Upload"
      :before-upload="beforeAvatarUpload"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      drag
      :limit="2"
      :file-list="fileList"
    >
      <!-- :before-remove="beforeRemove" -->
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div slot="tip" class="el-upload__tip">上传文件大小不能超过 1G</div>
    </el-upload>
    <!-- 按钮 -->
    <div>
      <el-button @click="cancelUpload">暂停上传</el-button>
      <el-button @click="ContinueUpload">断点续传</el-button>
    </div>

    <!-- 进度条 -->
    <el-progress
      v-show="showProgress"
      :text-inside="true"
      :stroke-width="15"
      :percentage="progress"
    ></el-progress>
  </div>
</template>

<script lang="ts">
import { client , getFileNameUUID  } from '@/utils/ali-oss';
import { Vue, Component, Prop} from 'vue-property-decorator';

@Component({})
export default class Home extends Vue {
  @Prop({default: 1}) public limit: number;

  private fileList: any[] = []; // 文件列
  private showProgress: boolean = false; // 进度条的显示
  private progress: number = 0; // 进度条百分比
  private tempCheckpoint; // 断点记录点。浏览器重启后无法直接继续上传，您需要手动触发继续上传。

  /**
   * @description: 文件超出个数限制时的钩子
   */
  public handleExceed(files, fileList) {
    this.$message.warning(`每次只能上传 ${this.limit} 个文件`);
  }

  /**
   * @description: 点击文件列表中已上传的文件时的钩子
   */
  public handlePreview(file) {}

  /**
   * @description: 删除文件之前的钩子
   */
  // public beforeRemove(file, fileList) {
  //   return this.$confirm(`确定移除 ${file.name}？`);
  // }

  /**
   * @description: 文件列表移除文件时的钩子
   */
  public handleRemove(file, fileList) {}

  /**
   * @description: 文件上传成功时的钩子
   */
  public handleSuccess(response, file, fileList) {
    this.fileList = fileList;
  }

  /**
   * @description: 文件上传前的校验
   */
  public beforeAvatarUpload(file) {
    const isLt100M = file.size / 1024 / 1024 > 10 && file.size / 1024 / 1024 < 1024;
    const isLt30 = file.name.length < 30;
    if (['video/mp4'].indexOf(file.type) === -1) {
      this.$message.error('请上传正确的视频格式');
      return false;
    }
    if (!isLt100M) {
      this.$message.error('上传视频大小要在10MB~1GB之间哦!');
      return false;
    }
    if (!isLt30) {
      this.$message.error('上传视频文件名称长度必须要小于30个文字哦!');
      return false;
    }
  }

  /**
   * @description: 分片上传
   */
  public Upload(file) {
    const that = this;
    async function multipartUpload() {
      const temporary = file.file.name.lastIndexOf('.');
      const fileNameLength: number = file.file.name.length;
      const fileFormat: string = file.file.name.substring(
        temporary + 1,
        fileNameLength,
      );
      const fileName = getFileNameUUID() + '.' + fileFormat;
      // oss目录（videoTest）
      client()
        .multipartUpload(`videoTest/${fileName}`, file.file, {
          progress(p, checkpoint) { // 回调值
            that.showProgress = true;
            that.progress = Math.floor(p * 100);
            that.tempCheckpoint = checkpoint; // 断点续传
          },
        })
        .then((result) => {
          // 上传成功返回值，可针对项目需求写其他逻辑
          // console.log(result, '成功上传');
        })
        .catch((err) => {
          console.log('err:', err);
        });
    }
    multipartUpload();
  }

  /**
   * @description: 断点续传
   */
  public ContinueUpload(file) {
    const that = this;
    async function resumeUpload() {
      const temporary = file.file.name.lastIndexOf('.');
      const fileNameLength: number = file.file.name.length;
      const fileFormat: string = file.file.name.substring(
        temporary + 1,
        fileNameLength,
      );
      const fileName = getFileNameUUID() + '.' + fileFormat;
      try {
        await client().multipartUpload(`videoTest/${fileName}`, file.file, {
          progress(p, checkpoint) {
            that.tempCheckpoint = checkpoint;
          },
          checkpoint: that.tempCheckpoint,
        });
      } catch (error) {
        console.log(error);
      }
    }
    if (client().isCancel()) {
      resumeUpload();
    } else {
      console.log('Upload is not suspended');
    }
  }

  /**
   * @description: 暂停分片上传
   */
  public cancelUpload() {
    client().cancel();
    if (client().isCancel()) {
      console.log('cancel success');
    }
  }
}
</script>
