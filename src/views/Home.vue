<template>
  <div class="home">
    <el-upload
      action
      :http-request="Upload"
      :before-upload="beforeAvatarUpload"
      :on-preview="handlePreview"
      :before-remove="beforeRemove"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      drag
      :limit="2"
      :file-list="fileList"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div slot="tip" class="el-upload__tip">上传文件大小不能超过 1G</div>
    </el-upload>


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
//@ts-ignore
import { client , getFileNameUUID  } from "@/utils/ali-oss";
import { Vue, Component, Prop} from 'vue-property-decorator'

export default class Home extends Vue{
  @Prop({default: 1}) limit?: Number;

  private fileList: any[] = [];
  private showProgress: boolean = false;
  private dataObj: object = {};
  private progress:number = 0;

  // 文件超出个数限制时的钩子
  handleExceed(files, fileList) {
    this.$message.warning(`每次只能上传 ${this.limit} 个文件`);
  }

  // 点击文件列表中已上传的文件时的钩子
  handlePreview(file) {},

  // 删除文件之前的钩子
  beforeRemove(file, fileList) {
    return this.$confirm(`确定移除 ${file.name}？`);
  }

  //文件列表移除文件时的钩子

  handleRemove(file, fileList) {}

  // 文件上传成功时的钩子
  handleSuccess(response, file, fileList) {
    this.fileList = fileList;
  }

  // 文件上传前的校验
  beforeAvatarUpload(file) {
    const isLt100M = file.size / 1024 / 1024> 10 && file.size / 1024 / 1024 < 1024;
    const isLt30 = file.name.length < 30;
    if (["video/mp4"].indexOf(file.type) == -1) {
      this.$message.error("请上传正确的视频格式");
      return false;
    }
    if (!isLt100M) {
      this.$message.error("上传视频大小要在10MB~1GB之间哦!");
      return false;
    }
    if (!isLt30) {
      this.$message.error("上传视频文件名称长度必须要小于30个文字哦!");
      return false;
    }
    // 请求后台接口拿配置参数
    return new Promise((resolve, reject) => {
      getAliOSSConfig()
        .then(response => {
          this.dataObj = response.data; //接口返回配置参数
          console.log(response.data);
          resolve(true);
        })
        .catch(err => {
          console.log(err);
          reject(false);
        });
    });
  }

  //http-request属性来覆盖默认的上传行为（即：action=“url”）,自定义上传的实现
      Upload(file) {
      const that = this;
      async function multipartUpload() {
        let temporary = file.file.name.lastIndexOf(".");
        let fileNameLength = file.file.name.length;
        let fileFormat = file.file.name.substring(
          temporary + 1,
          fileNameLength
        );
        let fileName = getFileNameUUID() + "." + fileFormat; 
        client(that.dataObj)
          .multipartUpload(`videoTest/${fileName}`, file.file, {
            progress: function(p) {
              //p进度条的值
              console.log(p);
              that.showProgress = true;
              that.progress = Math.floor(p * 100);
            }
          })
          .then(result => {
            //上传成功返回值，可针对项目需求写其他逻辑
            console.log(result);
          })
          .catch(err => {
            console.log("err:", err);
          });
      }
      multipartUpload();
    }
}

</script>
