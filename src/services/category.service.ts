import {Request,Response} from "express";

import {Category, ICategory} from "../models/category.model";
import {LanguageService} from "../services/language.service";

import { MongooseDocument } from "mongoose";



class CategoryHelpers{

    GetCategory(filter: any):Promise<ICategory>{        
        return new Promise<ICategory>( (resolve) => {
            Category.find(filter,(err:Error,category:ICategory)=>{
                if(err){
                    console.log(err);
                }else{
                    resolve(category);
                }
            }); 
        });
    }

    //
    GetCategoryByID(id_cat: string): Promise<ICategory>{
        return new Promise<ICategory>((resolve) => {
            Category.findById(id_cat,(err:Error, category:ICategory)=>{
                if(err){
                    console.log(err);
                }
                resolve(category);
            });
        });
    }

    
}


export class CategoryService extends CategoryHelpers{

    public getAll(req:Request, res:Response){
        Category.find({},(err:Error, categories: MongooseDocument)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(categories);
            }
            
        });
    }
    

    public getAllWLanguage(req:Request, res:Response){

        Category.aggregate([{
            "$lookup":{
                from: "languages",
                localField:"_id",
                foreignField:"category",
                as: "l"
            }
        }],(err:Error,data:any)=>{
            console.log("Entre al bucle 1")
            if(err){
                console.log("Entre al bucle 2a")
                res.status(401).send(err);
            }else{
                console.log("Entre al bucle 2b")
                res.status(200).json(data);
            }
        })
    }

    
    public async getOneCatWLaguages(req: Request, res:Response){
        const cat:any = await super.GetCategory({_id:req.params.id});
        let num: number;
        num = 0 ;
        
        for (let i=0; i<cat.length; i++){
            if(cat._id === super.GetCategory({_id:req.params.id})){
                num = i;
            }
            else{
                console.log("No encontrado");
            }
        }

        console.log(num);
       

        Category.aggregate([
            {$match: {"category": cat._id}},
        
            {"$lookup":{
                from: "languages",
                localField:"_id",
                foreignField:"category",
                as: "1"
            }}
        ],
        
        (err:Error,cat:any)=>{
        console.log("Entre al bucle 1")
            if(err){
                console.log("Entre al bucle 2a")
                res.status(401).send(err);
            }else{
                
                res.status(200).json(cat[num]);
                console.log("Entre al bucle 2b")
            }
        })
    }


    public async getOne(req:Request, res:Response){
        const cat:any = await super.GetCategory({_id:req.params.id});
        res.status(200).json(cat[0]);
    }

    public async NewOne(req: Request, res: Response){        
        const c = new Category(req.body);
        const old_cat:any = await super.GetCategory({name:c.name});

        if( old_cat.length === 0 ){
            await c.save((err:Error, category: ICategory)=>{
                if(err){
                    res.status(401).send(err);
                }else{
                    res.status(200).json( category? {successed:true, category: category } : {successed:false} );
                }            
            });
        }else{
            res.status(200).json({successed:false});
        }        

    }

    public async deleteOne(req: Request, res: Response){
        const language_service: LanguageService = new LanguageService();
        const languages:any = await language_service.GetLanguage({category: req.params.id});

        if( languages.length > 0 ){
            res.status(200).json({successed:false});
        }else{

            Category.findByIdAndDelete(req.params.id,(err:Error)=>{
                if(err){
                    res.status(401).send({successed:false});
                }else{
                    res.status(200).json({successed:true});
                }
            });

        }

    }

}
